import { createMachine } from "xstate";

export const machine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgWWQY0wEsA7MAOgBsB7KEswiCsAYgFUBlAUQCUAZAeQDiASQByAbQAMAXUSgADlViF0hKsTkgAHogCMAJgBsADjIBWAMwB2Q5ICchs7t22ALABoQATz1njVskljCwtHK1D9PwBfKM80LFwCEnJqWmJ6RhYAQQARbDEBEQkZTUVlVXVNHQQDE3NrWwcnF0kPbz19FzIrM0lJC10zcIdXVxi4jBx8IlJKGjoGJmZ2YUFRVgAFKVkkEDKVNQ1d6trTSxt7R2c3Tx8a3tMevoszO2DJXVc7cZB4qaTZqk6KhYGAAE68ebEZasADCsM47HY21KSgOlWOiDM+luiGMujIXzsbzsunx-Uihh+f0SMxSULIIPBkLSzAAYllhLxWNxOCjdvsKkdQCchgFjIYjK5DKNwmZXMZcTUQgFes8jDZ9PorNTJrTknM0mRkBAALYkFkkGHwxHIkoCtFCqpYnHtBAWfquQJ9ewtD12HWxX566YGoHpE3m4iW6Ecrk8vn2hSOw7O5WtcySyUGSJaoZK66GMiRPr6OyhOyuCzfIM00OAhnKKDEVDya0IpH85PlVOY+6GItvGwKwaRKz+AvSoshEIywwhYny3UJev0o1NlttuPc3ldvYpjEivQer1mLOdPN5qyTvzFtUq8cKuxmZf-OmM0FgnLIWCYABGVDIGCEBkAAboQYAAO4kFAABCVBUAA1rAzCwfw3DcPwADqe6Cr2R4IF8p5qtqQyRPKSr+EWTySPokhmE4ITGGMtYhgC5BMl+P7-oBwFgRB0HEHBCHIcwuQ5AA+gAKvwEkcgAauhwhSYiuEHsK2iIER5gkT0VjkW0dy6LRpglrRVguF8nyvvqsycd+v4AUBIHgVBMHwUhKHsOhUlqT2h6aYRlY6aWekGQWhjhN0aquFYfRnq4zg2auH7gg5PHOfxblCR5olcFk3CwgAEn56IadU2kMaFZEMYZx5xdFzzWI+xhvMl7GpVxjm8S5AnuSJXmcFJUliIIdo7N2ZVppVuk1RRbqxfojWlqSjGGLo7XvvZ3FOXxrmCcJnnMIU-CsL5Sb7v55WIJW4o+sYWrlgOVh1TUnx2N6pYPZFug2BYm0Gtt3WZft-VHbyuSlU6fYzdV+m1UqQwWMtkjhPoiUSsYAN2Z+6W7b12WHaJvKiJwOEXXhAUVcFVXmXNr2jktZmuP0dh0Y4VKsSuHVAxle19TlA3MLyUk8sUE2XVNMM07N8PzXc8N3n0ujVs1WbYxxuM7T1ZAAWCYJUAduXtraUP4YFfiSIEBjymepL9BYr3fUrHzBNK+L-Vzb6A1rwN8XrBtGyJ7KcjuiYS5T10IK8VvGP48rVsYlsBkqVg9MtLifFq-g1hM3Nbb7fMgSaEAwVJVBssgoFUGCKhwCbnYU+paaW9bkSuHbxkhK9AYBDR6MOP0cdY17tma2l2uZSXZcV1XNd1yh24JmbVNYnYsfx1WbzJ9ebpswEZlaj0fjzi+o8pbz+NkLANeqILR3sHCHbjaiV0t8YVsfO3ncOwzkrI8zBUHxrga06njHWN8wR3yJovUOy8m5vz7DHMgccehbyTh-FObpBj6WWq4SITR16Bjzt7HGE8-YgVBEBAEMCG4vwdIggircv620MPbbuBYLB0RdgMJGIwWIkLHmAyefEqFghoblWB8ZdwIKlkw9eKDN6Jx3gWIwH1+5PUrNWUBl8IFgHQNAlCxUsiiEEJwCSGwshIiwuhHIK8o6wzpnLV61gCQvWJNvSQtgk5Vh0YXK+oIDEwRQrBLIsIADS9i0zrStoMeKoQVajAekqfBTM1R9Asl44yI9BEX38TrAgyAhIwQ2D+WAkEa4QDoVE6WxE4bhTdNqK27jiQswDJ6F6fjyFFzIIU4pQlSmwHKZUkO0jw6vzkYFRxpFnFKi4QSAexJ5wfDPB8LpXUelgjACaMGiF2RiGEOwEqsjoYEVsEtda7cZSWFoh8RG+gAHpOaA4daAjgz5x9t0q+WzSBByQtUk55tqjMJth3NhXdHaTgsstCw+JN60XWeAzKPzCbGyXjIiOzckEKNQQnbemDd5GXwQs+8rx3jvURSIkCWz0CoDBMQXZALMWMIth-NurD2GQrdJFL0NFnDhC4dYN5dYeb5ORfoulDL757PReMhhkzgU4qUfi+whLECSi9GZew2J-AGA2ufDqkYSBIr4qaIpyA0i0PEhJNC-BImAtXu6GW9SEaNK3stKwt0HpBE5rkw1ZpjVUrIGa4gFrdkoV5Ngfg8lzG2vtcyhViBqx1KcQ0u4+g46PL6OvNUbtfXvNIeQI1xATUgRDWG6VKF5LCDJhYnIbIakEWTSFVNrr03hDcbm2F-gCGez9e+Ytpbg3mstZI1C6FMJYQkoURtgVm20xmWmxA2dTJqn0hKaUIRQGDqDeW0dQsuDDVGvQyapy53OtbfLZdZID5qhMB3Bi31t0BpLbukd4bjpCFOudBNZ7qgSg+vRPoEpEnai5em1Z5h7r0Q-rFVGz6oxDuntKplEy-1aTZSwsFnKzBKgea1F2acwMmBeAhwNFDjQQFLih2Vs7qYbzQcozBA48NMQ9b0cF0QDUDpfUOrZpoqDgRQ4-G0jdf1Aow5-UFP8Qi4cacEJaNE45lmWc+Mjr6KP8cE4y2jDqHFKsYyql5eHxxpOA40X6zFhVsR44hoNoMBkQAAGb7NEIc454nHW9AuaC65HpXTppMCS4DLgHoCuIQWoRO6KMOeEvrQ2LJUJhPjWhiT0djJkDifRBJjsFQBeXQ8vua6vG2GMmndTQ7AmGOYMY0x5jLHWNsXRpNF7F1tr0OWXlaohhVjLGePtkWUrRZ6VV4JYkciSQ4DwZrhEoqSl6LFEIv1XGGDwz6l2MpWiOC4RVoNo2hIhOSzNpwsTus5aSflhAnRQjLQHJEYyPXdsUb6ZawZwzgKoflehp1Ka2tXpqMEZGNEbkPJzTkwb-q7PPcwEU17ZSKkfd055qO87ZZLoB8xF2DFs5Vn1f2g0w2r7IagKwT8n3T1pdRy6-7uht5Y4cEK-E+aRW2fIz04npPwSjLDjNqnl7Xp0ReLdsk+C+iRRiEGYgVAIBwE0Cz5IqXHUAFo7BKiV0WH0mute09zhD984ZFdRwe9Oawrwt68JsAWVGjwSIMQYmwgMoDwwZCYIbtMzgMwqjN6rHBq3sFklifguO2J7DozWdxsMDJOIxjd32X6HwyDzhsK8dapIWaKmwdKD6M5rADDYS9IITuGTFpj19tLWdTAqnnFvOKzg5NGV+l6QHoQqJePXgN+XDZ1yEGbK2WPBFPghEywneKkoJSSknAOFBM4O35-T5Sih-fz0FmCMWIk68M1cOfKRiPZCNlX1i5IpfJx0bFnjp0XotRcwRUsIn+O-9aq1AXz0gOhtdnH8QPpL0d2GIWSGK8BiSiMsF2IwZTR9ZnGzT5ffHWYncuSuauWudAWXMvR1L-RPebIYHBAA+vG6NlGiD4T1WnUICLTvceaAzKSBaBI-FAqONAn-TA--Z8HAmoLMLHGcEwdaCAj5PfSrbZcRGYGBD-BAOgjAv-HoJgzhB5F2FmYyAMPHPXKA3goJA7IQkQ8iMQ7AuZNhFGOKDGAYZ-K+F7EpeHSpIQicN0UIZGeOD4VGPwGqAwnWLZHZaVVQ0-egjQiQt0M8UwAcAcJOPoUYDUBw8VX5d-GgtMNQ3-LAzwolF6boIkQHT4VqVoYIviGlSVMIinVAtw0Q6IwA7lNOZaOiUAt4DvSA2YQnHqIQ6sAsF6IsZmNmYyFwRwJ7HpPdcNIQ2Q9lX6JojuT1S7DNGURqB7dPFWEg8ootXjINYnXKIQmUb-XIxg-I9NasMzIIZOfBXXUgyjKHTZMAATITImOY0YdA9QvI5gzfMwW7JwbUJOTpXfSY3Yg-AWKADYZzY4hYs4pYi4-SIsXwmwQYHlIcVo541FGuQOFkD404qI74vDTfTLXwgcH0R2IYEEvRZQqAeAcIvseY6Ehg8Q5Y5dfoK2dJCyQXNhM+fHCoqY6HWHYwoZBHCAMwtVGoNmIsawthEweUXHNEqeKjGCTnMEToxKKDZWJbNmWUAY63MgU3VGSUYkD4GsGIIAA */
  id: "authMachine",
  initial: "login",
  states: {
    login: {
      initial: "idle",
      states: {
        idle: {
          on: {
            USERLOGIN: "userLogin",
            ADMINLOGIN: "adminLogin",
            SIGNUP: "signup"
          }
        },
        userLogin: {
          on: {
            SUCCESS: "#authMachine.userDashboard",
            FAILURE: "idle"
          }
        },
        adminLogin: {
          on: {
            SUCCESS: "#authMachine.adminDashboard",
            FAILURE: "idle"
          }
        },
        signup: {
          on: {
            SUCCESS: "userLogin",
            FAILURE: "idle"
          }
        }
      }
    },
    userDashboard: {
      initial: "viewingBooks",
      states: {
        viewingBooks: {
          on: {
            BORROW: "borrowingBook",
            ADD_TO_FAVORITES: "addingToFavorites",
            SORT: "sortingBooks",
            SEARCH: "searchingBooks",
            SETTINGS: "settings",
            LOGOUT: "#authMachine.login",
            READ: "readingBook",
            RENEW: "renewingBook",
            RETURN: "returningBook"
          }
        },
        borrowingBook: {
          on: {
            SUCCESS: "viewingBooks",
            FAILURE: "viewingBooks"
          }
        },
        addingToFavorites: {
          on: {
            SUCCESS: "viewingBooks",
            FAILURE: "viewingBooks"
          }
        },
        sortingBooks: {
          on: {
            SUCCESS: "viewingBooks",
            FAILURE: "viewingBooks"
          }
        },
        searchingBooks: {
          on: {
            SUCCESS: "viewingBooks",
            FAILURE: "viewingBooks"
          }
        },
        settings: {
          on: {
            CHANGE_PASSWORD: "changingPassword",
            BACK: "viewingBooks"
          }
        },
        changingPassword: {
          on: {
            SUCCESS: "settings",
            FAILURE: "settings"
          }
        },
        readingBook: {
          on: {
            FINISH: "viewingBooks"
          }
        },
        renewingBook: {
          on: {
            SUCCESS: "viewingBooks",
            FAILURE: "viewingBooks"
          }
        },
        returningBook: {
          on: {
            SUCCESS: "viewingBooks",
            FAILURE: "viewingBooks"
          }
        }
      }
    },
    adminDashboard: {
      initial: "managingBooks",
      states: {
        managingBooks: {
          on: {
            ADD_BOOK: "addingBook",
            REMOVE_BOOK: "removingBook",
            VIEW_PDF: "viewingPdf",
            BORROW_LOG: "viewingBorrowLog",
            SETTINGS: "settings",
            LOGOUT: "#authMachine.login"
          }
        },
        addingBook: {
          on: {
            SUCCESS: "managingBooks",
            FAILURE: "managingBooks"
          }
        },
        removingBook: {
          on: {
            SUCCESS: "managingBooks",
            FAILURE: "managingBooks"
          }
        },
        viewingPdf: {
          on: {
            FINISH: "managingBooks"
          }
        },
        viewingBorrowLog: {
          on: {
            BACK: "managingBooks"
          }
        },
        settings: {
          on: {
            CHANGE_PASSWORD: "changingPassword",
            ADD_USER: "addingUser",
            BACK: "managingBooks"
          }
        },
        changingPassword: {
          on: {
            SUCCESS: "settings",
            FAILURE: "settings"
          }
        },
        addingUser: {
          on: {
            SUCCESS: "settings",
            FAILURE: "settings"
          }
        }
      }
    }
  }
});