import React, {useState, useEffect} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Dialog,
DialogTitle,
DialogContent,
DialogActions,
IconButton,
} from '@material-ui/core'

import CloseIcon from '@material-ui/icons/Close';
import FavoriteIcon from '@material-ui/icons/Favorite';


import {
  PaperCard,
} from '../PreReviewComponents'


import axios from 'axios'

import { api_url, mapStateToProps } from '../globals.js';

import { connect } from "react-redux";

const useStyles = makeStyles(theme => ({
  button: {
    margin: '36px 0px 24px 12px',
    float: 'right',
  },
  margin: {
    marginTop: 20
  },
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },
  loader: {
    width: '100%',
  },
  clear : {
    clear: "both",
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}));

const PriorKnowledgeRandom = (props) => {
  const classes = useStyles();

  const [state, setState] = useState({
    "count_inclusions": 0,
    "count_exclusions": 0,
    "records": null,
    "loaded": false,
  });

  const includeRandomDocument = () => {
    props.includeItem(state["records"].id);

    setState({
      "count_inclusions": state["count_inclusions"] + 1,
      "count_exclusions": state["count_exclusions"],
      "records": null,
      "loaded": false,
    });

    props.updatePriorStats();
  }

  const excludeRandomDocument = () => {
    props.excludeItem(state["records"].id);

    setState({
      "count_inclusions": state["count_inclusions"],
      "count_exclusions": state["count_exclusions"] + 1,
      "records": null,
      "loaded": false,
    });

    props.updatePriorStats();
  }

  const resetCount = () => {
    setState({
      "count_inclusions": 0,
      "count_exclusions": 0,
      "records": null,
      "loaded": false,
    })
  }

  useEffect(() => {

    const getDocument = () => {
      const url = api_url + `project/${props.project_id}/prior_random`;

      return axios.get(url)
      .then((result) => {
        console.log("" + result.data['result'].length + " random items served for review")
        setState({
          "records": result.data['result'][0],
          "loaded": true,
        });
      })
      .catch((error) => {
        console.log(error);
      });
    }

    if(!state.loaded){
      getDocument();
    }
  }, [props.project_id, state.loaded]);

  return (
      <Dialog
        open={true}
        onClose={props.onClose}
      >
        <DialogTitle>
          Make a decision of this article
          {props.onClose ? (
            <IconButton aria-label="close" className={classes.closeButton} onClick={props.onClose}>
              <CloseIcon />
            </IconButton>
          ) : null}
        </DialogTitle>

        {state["count_exclusions"] < 5 &&
          <DialogContent dividers={true}>

            {!state["loaded"] ?
              <Box className={classes.loader}>
                <CircularProgress
                  style={{margin: "0 auto"}}
                />
              </Box> :
                <PaperCard
                  id={state["records"].id}
                  title={state["records"].title}
                  abstract={state["records"].abstract}
                />
            }
          </DialogContent>
        }

        {state["count_exclusions"] >= 5 &&
          <DialogContent dividers={true}>
            <Typography>
              We think you are done, but feel free to continue.
            </Typography>
            <Button
              variant="primary"
              color="default"
              className={classes.button}
              startIcon={<CloseIcon />}
              onClick={resetCount}
            >
              Show more
            </Button>
          </DialogContent>
        }

        <DialogActions>

          {/* Show the classification buttons if and only if classify is true */}
          <div style={{ margin: "0 auto" }}>
            <Button
              variant="primary"
              color="default"
              className={classes.button}
              startIcon={<FavoriteIcon />}
              onClick={() => includeRandomDocument(props.id)}
            >
              Relevant
            </Button>
            <Button
              variant="primary"
              color="default"
              className={classes.button}
              startIcon={<CloseIcon />}
              onClick={() => excludeRandomDocument(props.id)}
            >
              Irrelevant
            </Button>
          </div>
        </DialogActions>
      </Dialog>
  )
}

export default connect(mapStateToProps)(PriorKnowledgeRandom);
